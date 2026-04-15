import modulesData from '../data/modulesData.json';

export function getAllModules() {
    return modulesData.modules;
}

export function getModuleBySlug(slug) {
    return modulesData.modules.find(m => m.slug === slug) || null;
}

export function getModuleSlugs() {
    return modulesData.modules.map(m => m.slug);
}
