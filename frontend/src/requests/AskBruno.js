
const baseURI = `${import.meta.env.API_URL}/api`;

export async function askBruno(question){
    const params = new URLSearchParams({
        question: question
    });

    try {
        const res = await fetch(`${baseURI}/ask-bruno?${params}`);
        const json = await res.json();
        return json;
    } catch (err){
        return {error: true, message: err.message}
    }
}