import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { podcasts } from '../db/schema';
import { Env } from '../index';
import { sql } from 'drizzle-orm';

const podcast = new Hono<{ Bindings: Env }>().basePath('/podcast');

// Get all podcasts
podcast.get('/', async (c) => {
    const db = drizzle(c.env.DB);
    const allPodcasts = await db.select().from(podcasts);
    return c.json(allPodcasts);
});

// Get a specific podcast by ID
podcast.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const db = drizzle(c.env.DB);
    const podcast = await db.select()
        .from(podcasts)
        .where(sql`${podcasts.id} = ${id}`)
        .limit(1);
    
    if (!podcast.length) {
        return c.json({ error: 'Podcast not found' }, 404);
    }
    
    return c.json(podcast[0]);
});

// Create a new podcast entry
podcast.post('/', async (c) => {
    const body = await c.req.json();
    const db = drizzle(c.env.DB);
    
    try {
        const newPodcast = await db.insert(podcasts).values(body).returning();
        return c.json(newPodcast[0], 201);
    } catch (error) {
        return c.json({ error: 'Failed to create podcast' }, 400);
    }
});

// Update a podcast
podcast.put('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const db = drizzle(c.env.DB);
    
    try {
        const updatedPodcast = await db.update(podcasts)
            .set(body)
            .where(sql`${podcasts.id} = ${id}`)
            .returning();
            
        if (!updatedPodcast.length) {
            return c.json({ error: 'Podcast not found' }, 404);
        }
        
        return c.json(updatedPodcast[0]);
    } catch (error) {
        return c.json({ error: 'Failed to update podcast' }, 400);
    }
});

// Delete a podcast
podcast.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    const db = drizzle(c.env.DB);
    
    try {
        const deletedPodcast = await db.delete(podcasts)
            .where(sql`${podcasts.id} = ${id}`)
            .returning();
            
        if (!deletedPodcast.length) {
            return c.json({ error: 'Podcast not found' }, 404);
        }
        
        return c.json({ message: 'Podcast deleted successfully' });
    } catch (error) {
        return c.json({ error: 'Failed to delete podcast' }, 400);
    }
});

export default podcast;
