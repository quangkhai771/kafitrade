// Component loader for shared header and footer
class ComponentLoader {
    static async loadComponent(elementId, componentPath) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${response.status}`);
            }
            const html = await response.text();
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = html;
            }
        } catch (error) {
            console.error('Error loading component:', error);
        }
    }

    static async loadAll() {
        await Promise.all([
            this.loadComponent('header-component', '/assets/components/header.html'),
            this.loadComponent('footer-component', '/assets/components/footer.html')
        ]);
    }
}

// Auto-load components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ComponentLoader.loadAll();
});

// Export for manual use
window.ComponentLoader = ComponentLoader;
