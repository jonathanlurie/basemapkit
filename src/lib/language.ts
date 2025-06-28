import { language_script_pairs } from "@protomaps/basemaps";

export function isLanguageSupported(lang: string, script: string | undefined, verbose: boolean): boolean {
  const candidates = language_script_pairs.filter((l) => l.lang === lang);

  if (candidates.length === 0) {
    verbose &&
      console.warn(
        `The language "${lang}". The languages available are: ${language_script_pairs.map((l) => l.lang).join(", ")}.`,
      );
    return false;
  }

  if (script) {
    const candidatesWithScript = candidates.filter((l) => l.script === script);

    if (candidatesWithScript.length) {
      return true;
    }

    verbose &&
      console.warn(
        `The script "${script}" for the language "${lang}" is unsupported. Script available for this language: ${candidates.map((l) => l.script).join(", ")}.`,
      );
    return false;
  }

  return true;
}


export function getDefaultLanguage(): string {
  const systemLang = Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0];
  if (isLanguageSupported(systemLang, undefined, false)) {
    return systemLang;
  }
  return "en";
}