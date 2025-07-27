import { describe, it, expect, jest } from '@jest/globals'
import { semanticSearch } from '../search'
import PublicPromptTemplateModel from '../../models/PromptTemplate'
import VaultItemModel from '../../models/Vault';
import { getEmbedding } from '../embedding'
import { afterEach } from 'node:test'

jest.mock('../../models/PromptTemplate')
jest.mock('../../models/Vault')
jest.mock('../embedding')

const mockedGetEmbedding = getEmbedding as jest.Mock<any>
const mockedAggregateTemplate = PublicPromptTemplateModel.aggregate as jest.Mock<any>
const mockedAggregateVault = VaultItemModel.aggregate as jest.Mock<any>

describe('search module', () => {
	afterEach(() => {
		jest.clearAllMocks();
	})

	describe('Semantic Search', () => {
		const mockEmbedding = [0.1, 0.2, 0.3]
		it('should return adefault aggregated search results', async () => {
			const mockResults = [
				{
					id: '1',
					name: 'Prompt 1',
					score: 0.99,
				},
				{
					id: '2',
					name: 'Prompt 2',
					score: 0.88,
				},
			]
			mockedGetEmbedding.mockResolvedValue(mockEmbedding)
			mockedAggregateTemplate.mockResolvedValue(mockResults)

			const query = 'test query'
			const results = await semanticSearch(query)

			expect(mockedGetEmbedding).toHaveBeenCalledWith(query)
			expect(mockedAggregateTemplate).toHaveBeenCalledWith([
				expect.objectContaining({
					$vectorSearch: expect.objectContaining({
						queryVector: mockEmbedding,
					}),
				}),
				expect.objectContaining({
					$project: expect.any(Object),
				}),
				expect.objectContaining({
					$match: expect.any(Object),
				}),
			])
			expect(results.template).toEqual(mockResults)
		})

		it('should return aggregated search results by prefix', async () => {
			const mockData = [{
					vaultId: 'vault123', userId: 'user123',
					templateId: 'test-template',
					initialPrompt: 'Initial prompt',
					refinedPrompt: '',
					generatedContent: '',
					history: [],
					createdAt: new Date(),
					updatedAt: new Date(),
					name: 'Vault Item 1'
			}];
			mockedGetEmbedding.mockResolvedValue(mockEmbedding)
			mockedAggregateVault.mockResolvedValue(mockData)

			const query = 'content:test query'
			const results = await semanticSearch(query)

			expect(mockedGetEmbedding).toHaveBeenCalledWith('test query')
			expect(mockedAggregateVault).toHaveBeenCalledWith([
				expect.objectContaining({
					$vectorSearch: expect.objectContaining({
						queryVector: mockEmbedding,
					}),
				}),
				expect.objectContaining({
					$match: expect.any(Object),
				}),
				expect.objectContaining({
					$project: expect.any(Object),
				}),
				expect.objectContaining({
					$match: expect.any(Object),
				}),
			])
			expect(results.content).toEqual(mockData)
		})
	})
})
