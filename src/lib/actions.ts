'use server';

import { loadDomains, saveDomains, addDomain as addDomainToFile, updateDomain as updateDomainInFile, deleteDomain as deleteDomainFromFile } from './data-storage';
import { DomainInfo } from './types';

// 获取所有域名
export async function getAllDomains(): Promise<DomainInfo[]> {
    const domains = await loadDomains();
    return domains.map((domain: any) => ({
        id: domain.id,
        name: domain.name,
        expirationDate: new Date(domain.expirationDate),
        dateAdded: new Date(domain.dateAdded || domain.createdAt || Date.now())
    }));
}

// 添加新域名
export async function addDomain(domain: { name: string; expirationDate: Date }): Promise<DomainInfo> {
    const newDomain = await addDomainToFile({
        name: domain.name,
        expirationDate: domain.expirationDate.toISOString(),
        dateAdded: new Date().toISOString()
    });

    return {
        id: newDomain.id,
        name: newDomain.name,
        expirationDate: new Date(newDomain.expirationDate),
        dateAdded: new Date(newDomain.dateAdded || newDomain.createdAt)
    };
}

// 更新域名
export async function updateDomain(id: string, domainData: { name: string; expirationDate: Date }): Promise<DomainInfo | null> {
    const updatedDomain = await updateDomainInFile(id, {
        name: domainData.name,
        expirationDate: domainData.expirationDate.toISOString(),
    });

    if (!updatedDomain) return null;

    return {
        id: updatedDomain.id,
        name: updatedDomain.name,
        expirationDate: new Date(updatedDomain.expirationDate),
        dateAdded: new Date(updatedDomain.dateAdded || updatedDomain.createdAt)
    };
}

// 删除域名
export async function deleteDomain(id: string): Promise<string> {
    return await deleteDomainFromFile(id);
} 