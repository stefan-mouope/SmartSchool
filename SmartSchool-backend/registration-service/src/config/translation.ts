import * as deepl from "deepl-node";

// Ta clé API DeepL
const DEEPL_API_KEY = "df4385c2-33de-e423-4134-ca1f7b3ea8b7";

// Créer l'instance du traducteur
const translator = new deepl.Translator(DEEPL_API_KEY);

export const translateToEnglish = async (text: string): Promise<string> => {
  if (!text) return text;
  try {
    // Traduction FR -> EN-US
    const result = await translator.translateText(text, "fr", "en-US");
    return result.text;
  } catch (error) {
    console.error("Erreur traduction DeepL :", error);
    return text; // fallback
  }
};