import { jest, describe, it, expect } from '@jest/globals'

import {
	createVaultItem,
	getVaultItemById,
	getAllVaultItemsByUserId,
	updateVaultItem,
	deleteVaultItem,
} from '../vault'
import { getEmbedding } from '../embedding'
import VaultItemModel from '../../models/Vault'

jest.mock('../../models/Vault')
jest.mock('../embedding')

const mockedGetEmbedding = (getEmbedding as unknown) as jest.Mock<any>

describe('Vault', () => {
	mockedGetEmbedding.mockResolvedValue(undefined);
	describe('createVaultItem', () => {
		it('should create a new VaultItem', async () => {
			const mockData = {
				vaultId: 'vault123',
				templateId: 'template456',
				templateName: 'Template Name',
				initialPrompt: 'Initial prompt',
				refinedPrompt: '',
				generatedContent: '',
				name: 'Vault Item 1',
				description: 'Description 1',
			};

			(VaultItemModel.prototype.save as jest.Mock<
				any
			>).mockResolvedValue(mockData)

			const result = await createVaultItem(mockData)
			expect(mockedGetEmbedding).toHaveBeenCalledWith(expect.any(String))
			expect(result).toEqual(mockData)
			expect(VaultItemModel.prototype.save).toHaveBeenCalled()
		})
	})

	describe('getVaultItemById', () => {
		it('should return a VaultItem by vaultId', async () => {
			const mockData = {
				vaultId: 'vault123',
				templateId: 'template456',
				templateName: 'Template Name',
				initialPrompt: 'Initial prompt',
				refinedPrompt: '',
				generatedContent: '',
				name: 'Vault Item 1',
				description: 'Description 1',
			};

			(VaultItemModel.findOne as jest.Mock<any>).mockImplementation(
				() => ({
					select: jest.fn().mockResolvedValue(mockData as never),
				})
			)

			const result = await getVaultItemById('vault123')
			expect(result).toEqual(mockData)
			expect(VaultItemModel.findOne).toHaveBeenCalledWith({
				vaultId: 'vault123',
			})
		})

		it('should return null if VaultItem not found', async () => {
			;(VaultItemModel.findOne as jest.Mock<any>).mockImplementation(
				() => ({
					select: jest.fn().mockResolvedValue(null as never),
				})
			)

			const result = await getVaultItemById('vault123')
			expect(result).toBeNull()
			expect(VaultItemModel.findOne).toHaveBeenCalledWith({
				vaultId: 'vault123',
			})
		})
	})

	describe('getAllVaultItemsByUserId', () => {
		it('should return all VaultItems for a user', async () => {
			const mockData = [
				{
					vaultId: 'vault123',
					templateId: 'template456',
					templateName: 'Template Name',
					initialPrompt: 'Initial prompt',
					refinedPrompt: '',
					generatedContent: '',
					name: 'Vault Item 1',
					description: 'Description 1',
				},
			];

			(VaultItemModel.find as jest.Mock<any>).mockImplementation(() => ({
				select: jest.fn().mockImplementation(() => ({
					sort: jest.fn().mockResolvedValue(mockData as never),
				})),
			}))

			const result = await getAllVaultItemsByUserId('user123')
			expect(result).toEqual(mockData)
			expect(VaultItemModel.find).toHaveBeenCalledWith({
				userId: 'user123',
			})
		})
	})

	describe('updateVaultItem', () => {
		it('should update a VaultItem', async () => {
			const mockData = {
				vaultId: 'vault123',
				refinedPrompt: 'Updated prompt',
			}
			;(VaultItemModel.findOne as jest.Mock<any>).mockResolvedValue({
				...mockData,
				save: (jest.fn() as jest.Mock<any>).mockResolvedValue(mockData),
			})

			const result = await updateVaultItem('vault123', {
				refinedPrompt: 'Updated prompt',
			})
			expect(mockedGetEmbedding).toHaveBeenCalledWith(expect.any(String))
			expect(result).toEqual({ ...mockData })
			expect(VaultItemModel.findOne).toHaveBeenCalledWith({
				vaultId: 'vault123',
			})
		})

		it('should return null if VaultItem not found', async () => {
			;(VaultItemModel.findOne as jest.Mock<any>).mockResolvedValue(null)

			const result = await updateVaultItem('vault123', {
				refinedPrompt: 'Updated prompt',
			})
			expect(result).toBeNull()
			expect(VaultItemModel.findOne).toHaveBeenCalledWith({
				vaultId: 'vault123',
			})
		})
	})

	describe('deleteVaultItem', () => {
		it('should delete a VaultItem', async () => {
			const mockData = { vaultId: 'vault123' }
			;(VaultItemModel.findOneAndDelete as jest.Mock<
				any
			>).mockResolvedValue(mockData)

			const result = await deleteVaultItem('vault123')
			expect(result).toEqual(mockData)
			expect(VaultItemModel.findOneAndDelete).toHaveBeenCalledWith({
				vaultId: 'vault123',
			})
		})

		it('should return null if VaultItem not found', async () => {
			;(VaultItemModel.findOneAndDelete as jest.Mock<
				any
			>).mockResolvedValue(null)

			const result = await deleteVaultItem('vault123')
			expect(result).toBeNull()
			expect(VaultItemModel.findOneAndDelete).toHaveBeenCalledWith({
				vaultId: 'vault123',
			})
		})
	})
})
