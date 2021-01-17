import App from './App.svelte'
const app = {
    app: null
}
window.addEventListener('load', () => {
    app.app = new App({
        target: document.body,
    })
})
export default app