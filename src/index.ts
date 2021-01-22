import App from './App.svelte'
const app: {
    app: App | null
} = {
    app: null
}
window.addEventListener('load', () => {
    app.app = new App({
        target: document.body,
    })
})
export default app