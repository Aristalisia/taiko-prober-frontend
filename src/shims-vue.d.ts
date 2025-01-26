import { Router } from 'vue-router'

declare module '*.vue' {
    import { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
  }

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $moveTo: (path: string) => void;
        $router: Router;
    }
}