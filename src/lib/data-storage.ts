'use server';

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DOMAINS_FILE = path.join(DATA_DIR, 'domains.json');

// 确保数据目录存在
export async function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DOMAINS_FILE)) {
        fs.writeFileSync(DOMAINS_FILE, JSON.stringify({ domains: [] }), 'utf8');
    }
}

// 保存域名数据
export async function saveDomains(domains: any[]) {
    await ensureDataDir();
    fs.writeFileSync(DOMAINS_FILE, JSON.stringify({ domains }, null, 2), 'utf8');
    return domains;
}

// 读取域名数据
export async function loadDomains() {
    await ensureDataDir();
    try {
        const data = fs.readFileSync(DOMAINS_FILE, 'utf8');
        return JSON.parse(data).domains || [];
    } catch (error) {
        console.error('Error loading domains:', error);
        return [];
    }
}

// 添加域名
export async function addDomain(domain: any) {
    const domains = await loadDomains();
    const newDomain = {
        id: Date.now().toString(),
        ...domain,
        createdAt: new Date().toISOString(),
    };
    domains.push(newDomain);
    await saveDomains(domains);
    return newDomain;
}

// 更新域名
export async function updateDomain(id: string, domainData: any) {
    const domains = await loadDomains();
    const index = domains.findIndex((d: any) => d.id === id);
    if (index !== -1) {
        domains[index] = {
            ...domains[index],
            ...domainData,
            updatedAt: new Date().toISOString(),
        };
        await saveDomains(domains);
        return domains[index];
    }
    return null;
}

// 删除域名
export async function deleteDomain(id: string) {
    const domains = await loadDomains();
    const filteredDomains = domains.filter((d: any) => d.id !== id);
    await saveDomains(filteredDomains);
    return id;
} 