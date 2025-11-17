var documentEventListeners = { keydown: [], keyup: [] }; //for handling key events
async function fetchJSON(filename) {
    try {
        const response = await fetch(filename);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) { console.error(error.message); }
}
function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max)
}