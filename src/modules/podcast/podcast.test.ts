import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { drizzle } from 'drizzle-orm/d1';
import { db } from '../../db';
import { UploadService } from '../../services/uploadService';
import { PodcastService } from './podcast.service';
import { nanoid } from 'nanoid';

// Mock drizzle
mock.module('drizzle-orm/d1', () => ({
  drizzle: () => ({
    insert: (table: any) => ({
      values: (data: any) => {
        const id = nanoid();
        if (table.name === 'podcasts') {
          const podcast = {
            id,
            title: data.title,
            description: data.description,
            coverImage: data.coverImage,
            authorId: data.authorId,
            totalEpisodes: 0,
            totalDuration: 0,
          };
          return {
            returning: () => Promise.resolve([podcast]),
          };
        }
        if (table.name === 'episodes') {
          const episode = {
            id,
            title: data.title,
            description: data.description,
            audioUrl: data.audioUrl,
            duration: data.duration,
            episodeNumber: data.episodeNumber,
            podcastId: data.podcastId,
          };
          return {
            returning: () => Promise.resolve([episode]),
          };
        }
        return {
          returning: () => Promise.resolve([null]),
        };
      },
    }),
    select: () => ({
      from: (table: any) => ({
        where: (condition: any) => ({
          get: () => {
            const id = condition.right;
            if (table.name === 'podcasts') {
              return Promise.resolve({
                id,
                title: 'Test Podcast',
                description: 'Test Description',
                coverImage: 'https://example.com/cover.jpg',
                authorId: 'test-user-id',
                totalEpisodes: 0,
                totalDuration: 0,
              });
            }
            if (table.name === 'episodes') {
              return Promise.resolve({
                id,
                title: 'Test Episode',
                description: 'Test Episode Description',
                audioUrl: 'https://example.com/audio.mp3',
                duration: 300,
                episodeNumber: 1,
              });
            }
            return Promise.resolve(null);
          },
          all: () => {
            if (table.name === 'podcasts') {
              return Promise.resolve([{
                id: nanoid(),
                title: 'Test Podcast',
                description: 'Test Description',
                coverImage: 'https://example.com/cover.jpg',
                authorId: 'test-user-id',
                totalEpisodes: 0,
                totalDuration: 0,
              }]);
            }
            if (table.name === 'episodes') {
              return Promise.resolve([{
                id: nanoid(),
                title: 'Test Episode',
                description: 'Test Episode Description',
                audioUrl: 'https://example.com/audio.mp3',
                duration: 300,
                episodeNumber: 1,
              }]);
            }
            return Promise.resolve([]);
          },
        }),
      }),
    }),
    update: (table: any) => ({
      set: (data: any) => ({
        where: (condition: any) => {
          const id = condition.right;
          if (table.name === 'podcasts') {
            const podcast = {
              id,
              title: 'Test Podcast',
              description: 'Test Description',
              coverImage: 'https://example.com/cover.jpg',
              authorId: 'test-user-id',
              totalEpisodes: data.totalEpisodes ?? 0,
              totalDuration: data.totalDuration ?? 0,
              ...data,
            };
            return {
              returning: () => Promise.resolve([podcast]),
            };
          }
          return {
            returning: () => Promise.resolve([null]),
          };
        },
      }),
    }),
    delete: (table: any) => ({
      where: (condition: any) => {
        return Promise.resolve();
      },
    }),
  }),
}));

describe('PodcastService', () => {
  let mockD1: D1Database;
  let podcastService: PodcastService;
  
  const getUploadUrlMock = mock(async () => ({
    uploadUrl: 'https://example.com/upload',
    fileKey: 'test-key',
  }));

  const mockUploadService = {
    getUploadUrl: getUploadUrlMock,
  } as unknown as UploadService;

  const userId = 'test-user-id';

  const testPodcast = {
    title: 'Test Podcast',
    description: 'Test Description',
    coverImageUrl: 'https://example.com/cover.jpg',
  };

  const testEpisode = {
    title: 'Test Episode',
    description: 'Test Episode Description',
    audioUrl: 'https://example.com/audio.mp3',
    duration: 300,
    episodeNumber: 1,
  };

  beforeEach(() => {
    mockD1 = {} as D1Database;
    podcastService = new PodcastService(mockUploadService, mockD1);
    getUploadUrlMock.mockClear();
  });

  describe('createPodcast', () => {
    test('should create podcast with all fields', async () => {
      const result = await podcastService.createPodcast(testPodcast, userId);

      expect(result).toBeDefined();
      expect(result.title).toBe(testPodcast.title);
      expect(result.description).toBe(testPodcast.description);
      expect(result.coverImage).toBe(testPodcast.coverImageUrl);
      expect(result.authorId).toBe(userId);
      expect(result.totalEpisodes).toBe(0);
      expect(result.totalDuration).toBe(0);
    });

    test('should create podcast with only required fields', async () => {
      const { coverImageUrl, ...requiredFields } = testPodcast;
      const result = await podcastService.createPodcast(requiredFields, userId);

      expect(result.coverImage).toBeNull();
      expect(result.title).toBe(requiredFields.title);
      expect(result.description).toBe(requiredFields.description);
    });
  });

  describe('getPodcast', () => {
    test('should get podcast by id with all details', async () => {
      // Create a podcast first
      const created = await podcastService.createPodcast(testPodcast, userId);
      const result = await podcastService.getPodcast(created.id);

      expect(result).toBeDefined();
      expect(result?.title).toBe(testPodcast.title);
      expect(result?.description).toBe(testPodcast.description);
    });

    test('should return null for non-existent podcast', async () => {
      const result = await podcastService.getPodcast('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('updatePodcast', () => {
    test('should update podcast fields', async () => {
      // Create a podcast first
      const created = await podcastService.createPodcast(testPodcast, userId);
      
      const updateInput = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      const result = await podcastService.updatePodcast(created.id, updateInput, userId);

      expect(result.title).toBe(updateInput.title);
      expect(result.description).toBe(updateInput.description);
    });

    test('should not update non-existent podcast', async () => {
      const promise = podcastService.updatePodcast('non-existent-id', { title: 'New Title' }, userId);
      await expect(promise).rejects.toThrow('Podcast not found');
    });

    test('should not update podcast by non-author', async () => {
      // Create a podcast first
      const created = await podcastService.createPodcast(testPodcast, userId);
      
      const promise = podcastService.updatePodcast(created.id, { title: 'New Title' }, 'different-user-id');
      await expect(promise).rejects.toThrow('Unauthorized');
    });
  });

  describe('addEpisode', () => {
    test('should add episode with all fields', async () => {
      // Create a podcast first
      const created = await podcastService.createPodcast(testPodcast, userId);
      
      const result = await podcastService.addEpisode(created.id, testEpisode, userId);

      expect(result).toBeDefined();
      expect(result.title).toBe(testEpisode.title);
      expect(result.description).toBe(testEpisode.description);
      expect(result.audioUrl).toBe(testEpisode.audioUrl);
      expect(result.duration).toBe(testEpisode.duration);
      expect(result.episodeNumber).toBe(testEpisode.episodeNumber);
    });

    test('should update podcast stats after adding episode', async () => {
      // Create a podcast first
      const created = await podcastService.createPodcast(testPodcast, userId);
      
      await podcastService.addEpisode(created.id, testEpisode, userId);
      const updatedPodcast = await podcastService.getPodcast(created.id);

      expect(updatedPodcast?.totalEpisodes).toBe(1);
      expect(updatedPodcast?.totalDuration).toBe(testEpisode.duration);
    });

    test('should add episode with only required fields', async () => {
      // Create a podcast first
      const created = await podcastService.createPodcast(testPodcast, userId);
      
      const { description, episodeNumber, ...requiredFields } = testEpisode;
      const result = await podcastService.addEpisode(created.id, requiredFields, userId);

      expect(result.description).toBeNull();
      expect(result.episodeNumber).toBeNull();
      expect(result.title).toBe(requiredFields.title);
      expect(result.audioUrl).toBe(requiredFields.audioUrl);
    });

    test('should not add episode to non-existent podcast', async () => {
      const promise = podcastService.addEpisode('non-existent-id', testEpisode, userId);
      await expect(promise).rejects.toThrow('Podcast not found');
    });

    test('should not add episode by non-author', async () => {
      // Create a podcast first
      const created = await podcastService.createPodcast(testPodcast, userId);
      
      const promise = podcastService.addEpisode(created.id, testEpisode, 'different-user-id');
      await expect(promise).rejects.toThrow('Unauthorized');
    });
  });

  describe('getUploadUrl', () => {
    test('should get upload url for audio file', async () => {
      const result = await podcastService.getUploadUrl('test.mp3', 'audio/mpeg');

      expect(result).toEqual({
        uploadUrl: 'https://example.com/upload',
        fileKey: 'test-key',
      });
      expect(getUploadUrlMock).toHaveBeenCalledWith('test.mp3', 'audio/mpeg');
    });

    test('should handle upload service errors', async () => {
      getUploadUrlMock.mockImplementation(async () => {
        throw new Error('Upload failed');
      });

      const promise = podcastService.getUploadUrl('test.mp3', 'audio/mpeg');
      await expect(promise).rejects.toThrow('Upload failed');
    });
  });
});
