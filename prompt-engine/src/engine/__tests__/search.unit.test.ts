import { describe, it, expect, jest, afterEach } from '@jest/globals'
import { extractPrefix, semanticSearch } from '../search'
import PublicPromptTemplateModel from '../../models/PromptTemplate'
import { getEmbedding } from '../embedding'

jest.mock('../../models/PromptTemplate')
jest.mock('../embedding')

const mockedGetEmbedding = getEmbedding as jest.Mock<any>
const mockedAggregate = PublicPromptTemplateModel.aggregate as jest.Mock<any>

describe('search module', () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('Semantic Search', () => {
		it('extract prefix from search without prefix', () => {
			const query = 'test query'
			const { prefix, text } = extractPrefix(query)

			expect(prefix).toEqual(':default ')
			expect(text).toEqual('test query')

		})

		it('extract prefix from search', () => {
			const query = ':template test query'
			const { prefix, text } = extractPrefix(query)

			expect(prefix).toEqual(':template ')
			expect(text).toEqual('test query')

		})

		it('should return aggregated search results', async () => {
			const mockEmbedding = [0.1, 0.2, 0.3]
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
			mockedAggregate.mockResolvedValue(mockResults)

			const query = 'test query'
			const limit = 2
			const results = await semanticSearch(':default ', query, limit)

			expect(mockedGetEmbedding).toHaveBeenCalledWith(query)
			expect(mockedAggregate).toHaveBeenCalledWith([
				expect.objectContaining({
					$vectorSearch: expect.objectContaining({
						queryVector: mockEmbedding,
						limit,
					}),
				}),
				expect.objectContaining({
					$project: expect.any(Object),
				}),
				expect.objectContaining({
					$match: expect.any(Object),
				}),
			])
			expect(results).toEqual(mockResults)
		})
	})
})
