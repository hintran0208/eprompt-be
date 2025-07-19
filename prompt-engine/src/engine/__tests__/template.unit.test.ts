import { describe, it, expect, afterEach, jest } from '@jest/globals'
import {
	createPromptTemplate,
	updatePromptTemplate,
	updateEmbeddings,
} from '../template'
import PublicPromptTemplateModel from '../../models/PromptTemplate'
import { getEmbedding } from '../huggingface'
import { PromptTemplate } from '../types'

jest.mock('../../models/PromptTemplate')
jest.mock('../huggingface')

const mockedGetEmbedding = (getEmbedding as unknown) as jest.Mock<any>
const mockedFindOneAndUpdate = PublicPromptTemplateModel.findOneAndUpdate as jest.Mock<any>
const mockedFind = PublicPromptTemplateModel.find as jest.Mock<any>
const mockedConstructor = (PublicPromptTemplateModel as unknown) as jest.Mock<any>

describe('Template Engine', () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('createPromptTemplate', () => {
		it('should create a new prompt template with embedding', async () => {
			const mockData: PromptTemplate = {
				id: '1',
				name: 'Test Template',
				description: 'A test template',
				template: 'Test content',
				role: 'Test role',
				tags: ['test'],
				requiredFields: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			}
			const mockEmbedding: number[] = [0.1, 0.2, 0.3]
			mockedGetEmbedding.mockResolvedValue(mockEmbedding)

			// Mock instance and save
			const mockSave = jest.fn().mockImplementation(() =>
				Promise.resolve({
					...mockData,
					embedding: mockEmbedding,
				})
			)
			mockedConstructor.mockImplementation(function (
				this: any,
				args: any
			) {
				Object.assign(this, args)
				this.save = mockSave
			})

			const result = await createPromptTemplate(mockData)

			expect(mockedGetEmbedding).toHaveBeenCalledWith(expect.any(String))
			expect(mockedConstructor).toHaveBeenCalledWith(
				expect.objectContaining({
					...mockData,
					embedding: mockEmbedding,
					createdAt: expect.any(Date),
					updatedAt: expect.any(Date),
				})
			)
			expect(result).toEqual(
				expect.objectContaining({
					...mockData,
					embedding: mockEmbedding,
				})
			)
		})
	})

	describe('updatePromptTemplate', () => {
		it('should update an existing prompt template with new embedding', async () => {
			const mockData: PromptTemplate = {
				id: '1',
				name: 'Updated Template',
				description: 'Updated description',
				template: 'Updated content',
				role: 'Updated role',
				tags: ['updated'],
				requiredFields: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			}
			const mockEmbedding: number[] = [0.4, 0.5, 0.6]
			const mockUpdatedData = { ...mockData, embedding: mockEmbedding }
			mockedGetEmbedding.mockResolvedValue(mockEmbedding)
			mockedFindOneAndUpdate.mockResolvedValue(
				mockUpdatedData as PromptTemplate
			)

			const result = await updatePromptTemplate(mockData)

			expect(mockedGetEmbedding).toHaveBeenCalledWith(expect.any(String))
			expect(mockedFindOneAndUpdate).toHaveBeenCalledWith(
				{ id: mockData.id },
				expect.objectContaining({
					...mockData,
					embedding: mockEmbedding,
					updatedAt: expect.any(Date),
				}),
				{ new: true }
			)
			expect(result).toEqual(mockUpdatedData)
		})
	})

	describe('updateEmbeddings', () => {
		it('should update embeddings for all templates', async () => {
			const mockTemplates = [
				{
					id: '1',
					name: 'Template 1',
					embedding: [0.1],
					save: jest.fn(),
				},
				{
					id: '2',
					name: 'Template 2',
					embedding: [0.2],
					save: jest.fn(),
				},
			]
			const mockEmbeddings: number[][] = [[0.3], [0.4]]
			mockedFind.mockResolvedValue(mockTemplates)
			mockedGetEmbedding
				.mockResolvedValueOnce(mockEmbeddings[0])
				.mockResolvedValueOnce(mockEmbeddings[1])

			const result = await updateEmbeddings()

			expect(mockedFind).toHaveBeenCalled()
			expect(mockedGetEmbedding).toHaveBeenCalledTimes(
				mockTemplates.length
			)
			expect(mockTemplates[0].save).toHaveBeenCalled()
			expect(mockTemplates[1].save).toHaveBeenCalled()
			expect(result).toEqual({
				updatedCount: mockTemplates.length,
				updatedIds: mockTemplates.map((t) => t.id),
			})
		})
	})
})
