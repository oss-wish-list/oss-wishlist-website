// Content moderation utility
// Filters profanity, hate speech, spam, and inappropriate content

import { profanity } from '@2toad/profanity';

// Add additional words for comprehensive filtering
// Note: @2toad/profanity already includes many slurs and hate speech terms
// We're adding additional terms and variants that might be missed

// Crude/bathroom humor
profanity.addWords([
  'fart',
  'farts',
  'farting',
  'butt',
  'butts',
  'crap',
  'crappy',
  'pee',
  'poop',
  'poopy'
]);

// Hate speech, discriminatory, and extremist terms
// These are added to catch dog whistles and coded language
profanity.addWords([
  // General slurs and discriminatory terms (many already in library)
  'tranny',
  'trannies',
  'groomer',
  'groomers',
  
  // Anti-immigrant and xenophobic terms
  'illegals',
  'wetback',
  'wetbacks',
  'anchor baby',
  'border jumper',
  'invader',
  'invaders',
  
  // Nazi and white supremacist terms/symbols (text versions)
  'nazi',
  'nazis',
  'neonazi',
  'heil hitler',
  'white power',
  'white pride',
  '88', // Code for "Heil Hitler"
  '1488',
  'SS',
  'swastika',
  'aryan',
  'blood and soil',
  'jews will not replace us',
  
  // Far-right extremist terms and conspiracy theories
  'great replacement',
  'white genocide',
  'cultural marxism',
  'globalist',
  'globalists',
  'zog', // Zionist Occupied Government
  'race traitor',
  'race mixing',
  'miscegenation',
  
  // Homophobic slurs and terms
  'sodomite',
  'sodomites',
  'homo',
  'homos',
  
  // Transphobic terms
  'trap',
  'traps',
  'shemale',
  'shemales',
  'autogynephilia',
  'agp',
  'rapid onset gender dysphoria',
  'rogd',
  
  // Misogynistic terms
  'femoid',
  'femoids',
  'roastie',
  'roasties',
  'incel',
  'blackpill',
  'redpill',
  'mgtow',
  
  // Racist dog whistles and coded language
  'dindu',
  'dindus',
  'jogger',
  'joggers',
  'despite being 13',
  'crime statistics',
  'white replacement',
  'demographic replacement',
  
  // Islamophobic terms
  'mohammedan',
  'mohammedans',
  'muzzie',
  'muzzies',
  'sandnigger',
  'sandniggers',
  'towelhead',
  'towelheads',
  'camel jockey',
  
  // Antisemitic terms and tropes
  'zionist',
  'zionists',
  'rootless cosmopolitan',
  'globalist elite',
  'cultural bolshevism',
  'judeo-bolshevism',
  'the jew',
  'the jews',
  
  // Ableist slurs
  'retard',
  'retarded',
  'retards',
  'sperg',
  'spergs',
  'aspie',
  'autist',
  'autists',
  'mongoloid',
  'mongoloids'
]);

export interface ModerationResult {
  isClean: boolean;
  reason?: string;
}

/**
 * Check if text contains profanity, hate speech, or inappropriate content
 */
export function moderateContent(text: string): ModerationResult {
  if (!text || text.trim().length === 0) {
    return { isClean: true };
  }

  // Check for profanity and offensive language
  const hasProfanity = profanity.exists(text);
  
  if (hasProfanity) {
    return {
      isClean: false,
      reason: 'Please remove inappropriate language and try again'
    };
  }

  // Check for spam patterns
  const spamResult = checkSpamPatterns(text);
  if (!spamResult.isClean) {
    return spamResult;
  }

  return { isClean: true };
}

/**
 * Check for common spam patterns
 */
function checkSpamPatterns(text: string): ModerationResult {
  const lowerText = text.toLowerCase();

  // Check for hate speech phrases and dog whistles
  const hateSpeechPatterns = [
    /white\s+power/i,
    /white\s+pride/i,
    /white\s+genocide/i,
    /white\s+replacement/i,
    /great\s+replacement/i,
    /blood\s+and\s+soil/i,
    /jews?\s+will\s+not\s+replace/i,
    /cultural\s+marxis[mt]/i,
    /race\s+traitor/i,
    /race\s+mixing/i,
    /anchor\s+bab(y|ies)/i,
    /border\s+jumper/i,
    /despite\s+(being\s+)?13/i,
    /crime\s+statistics/i,
    /rootless\s+cosmopolitan/i,
    /globalist\s+elite/i,
    /cultural\s+bolshevism/i,
    /heil\s+hitler/i,
    /14\s*88/i,
    /maga/i, // MAGA movement associated term
    /make\s+america\s+great/i,
    /trump\s+2024/i, // Political campaigning
    /build\s+the\s+wall/i,
    /send\s+them\s+back/i,
    /go\s+back\s+to\s+your\s+country/i,
    /illegals?\s+immigrants?/i,
    /trans\s+agenda/i,
    /gender\s+ideology/i,
    /woke\s+mind\s+virus/i,
    /grooming\s+(children|kids)/i,
    /protecting\s+children/i, // Often code for anti-trans rhetoric
  ];

  for (const pattern of hateSpeechPatterns) {
    if (pattern.test(text)) {
      return {
        isClean: false,
        reason: 'Please remove inappropriate or discriminatory language and try again'
      };
    }
  }

  // Excessive capitalization (more than 50% caps in text over 20 chars)
  if (text.length > 20) {
    const capsCount = (text.match(/[A-Z]/g) || []).length;
    const lettersCount = (text.match(/[a-zA-Z]/g) || []).length;
    if (lettersCount > 0 && capsCount / lettersCount > 0.5) {
      return {
        isClean: false,
        reason: 'Please avoid excessive capitalization'
      };
    }
  }

  // Excessive repetition of characters (e.g., "heeeeelp", "!!!!!")
  if (/(.)\1{4,}/.test(text)) {
    return {
      isClean: false,
      reason: 'Please avoid excessive character repetition'
    };
  }

  // Common spam keywords
  const spamKeywords = [
    'click here',
    'buy now',
    'limited time offer',
    'act now',
    'double your',
    'free money',
    'make money fast',
    'work from home',
    'bitcoin',
    'cryptocurrency scam',
    'nigerian prince',
    'inheritance',
    'congratulations you won',
    'claim your prize',
    'weight loss',
    'viagra',
    'cialis',
    'casino',
    'lottery winner'
  ];

  for (const keyword of spamKeywords) {
    if (lowerText.includes(keyword)) {
      return {
        isClean: false,
        reason: 'Please remove spam content and try again'
      };
    }
  }

  // Check for excessive URLs (more than 3)
  const urlCount = (text.match(/https?:\/\//gi) || []).length;
  if (urlCount > 3) {
    return {
      isClean: false,
      reason: 'Please limit the number of URLs (maximum 3)'
    };
  }

  return { isClean: true };
}

/**
 * Moderate multiple fields at once
 */
export function moderateFields(fields: Record<string, string>): ModerationResult {
  for (const [fieldName, value] of Object.entries(fields)) {
    const result = moderateContent(value);
    if (!result.isClean) {
      return {
        ...result,
        reason: `${fieldName}: ${result.reason}`
      };
    }
  }
  return { isClean: true };
}

/**
 * Clean text by replacing profanity with asterisks
 * Use this if you want to sanitize instead of reject
 */
export function cleanText(text: string): string {
  return profanity.censor(text);
}
