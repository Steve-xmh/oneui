import App from './App.svelte'
const app: {
    app: App | null
} = {
    app: null
}
function setup () {
    window.document.body.innerHTML = ''
    app.app = new App({
        target: document.body,
    })
}
if (window.document.body) {
    setup()
} else {
    window.addEventListener('load', setup)
}
export default app