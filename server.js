const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI('AIzaSyD-alV9yvAnM3k3TA4VRRGYePr4wJFwgks');
/*
deprycated
async function translateText(text, sourceLang = 'en', destLang = 'ta') {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${destLang}&dt=t&q=${encodeURI(text)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const translatedText = data[0][0][0];
        return translatedText;
    } catch (error) {
        console.error('Error translating text:', error);
        return null;
    }
}*/

async function run(p) {
    try {
        const model = await genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const prompt = p;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text2 = await response.text();
        return text2;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function generate_essay_prompt(p = 'Give me an essay title'){
  const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro"});
  const prompt = p;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}

io.on("connection", (socket) => {
    socket.on('generate-essay' , async (data)=>{
        console.log('request_id: ' + data)
        const x = await generate_essay_prompt();
        run('Generate an essay on '+ x + 'No headers , spaces between paragraphs')
        .then((o)=>{
            io.emit(data , ({content: o , title: x}));
            console.log('task-completed');
        });
    });
});

const PORT = process.env.PORT || 6969;

server.listen(PORT, () => {
    console.log(`Server is up and running on port : ${PORT}.`);
});