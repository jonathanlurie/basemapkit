import { language_script_pairs } from "@protomaps/basemaps";

export function isLanguageSupported(lang: string, script: string | undefined): boolean {
  const candidates = language_script_pairs.filter((l) => l.lang === lang);

  if (candidates.length === 0) {
    throw new Error(
      `The language "${lang}". The languages available are: ${language_script_pairs.map((l) => l.lang).join(", ")}.`,
    );
  }

  if (script) {
    const candidatesWithScript = candidates.filter((l) => l.script === script);

    if (candidatesWithScript.length) {
      return true;
    }

    throw new Error(
      `The script "${script}" for the language "${lang}" is unsupported. Script available for this language: ${candidates.map((l) => l.script).join(", ")}.`,
    );
  }

  return true;
}

export function getDefaultLanguage(): string {
  const systemLang = Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0];
  if (isLanguageSupported(systemLang, undefined)) {
    return systemLang;
  }
  return "en";
}
