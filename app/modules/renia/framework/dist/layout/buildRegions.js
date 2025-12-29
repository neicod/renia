export const buildRegions = (root) => {
    const regions = {};
    for (const regionNode of root.children.values()) {
        const region = regionNode.id;
        if (!regions[region])
            regions[region] = [];
        if (regionNode.component || regionNode.componentPath) {
            regions[region].push({
                region,
                component: regionNode.component,
                componentPath: regionNode.componentPath,
                priority: 0,
                props: regionNode.props,
                meta: regionNode.meta
            });
        }
        for (const child of regionNode.children.values()) {
            if (child.component || child.componentPath) {
                regions[region].push({
                    region,
                    id: child.id,
                    component: child.component,
                    componentPath: child.componentPath,
                    priority: 0,
                    enabled: true,
                    props: child.props,
                    meta: child.meta
                });
            }
        }
    }
    return regions;
};
export default buildRegions;
