import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'dummy_key_to_prevent_crash',
  dangerouslyAllowBrowser: true, // Necessário pois estamos rodando direto no cliente
});

export const ocrService = {
  /**
   * Envia uma imagem em Base64 para a OpenAI extrair o texto manuscrito ou digitado.
   * @param base64Image String contendo a imagem em base64 (sem o prefixo data:image/jpeg;base64,)
   * @returns O texto extraído da imagem
   */
  async extractTextFromImage(base64Image: string): Promise<string> {
    try {
      // Remover o prefixo caso ele venha (ex: data:image/png;base64,)
      const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

      const response = await client.chat.completions.create({
        model: "gpt-4o", // gpt-4o tem excelentes capacidades de visão e OCR
        messages: [
          {
            role: "system",
            content: "Você é um especialista em OCR focado em redações e textos manuscritos. Sua única tarefa é ler a imagem fornecida e transcrever exata e fielmente o que está escrito nela. Mantenha os parágrafos e a estrutura do texto original. Não adicione nenhum comentário adicional, não diga 'Aqui está o texto:', retorne APENAS o texto extraído da imagem. Caso a imagem seja ilegível ou não contenha texto compreensível, retorne uma string vazia."
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${cleanBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1, // Temperatura baixa para evitar alucinações na transcrição
      });

      const extractedText = response.choices[0]?.message?.content || "";
      return extractedText.trim();
    } catch (error: any) {
      console.error("Erro no OCR:", error);
      throw new Error(error.message || "Falha ao extrair o texto da imagem.");
    }
  }
};
