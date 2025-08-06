export interface ProcessedWorkerData {
  // Worker fields
  first_name: string;
  surname: string;
  mobile_phone?: string;
  email?: string;
  union_membership_status: 'member' | 'non_member' | 'potential' | 'declined';
  
  // Employer linking
  company_name: string;
  
  // Organizer info (optional for reference)
  organizer_number?: string;
  organizer_surname?: string;
  organizer_first_name?: string;
  
  // Member info
  member_number?: string;
  comments?: string;
  source_file?: string;
}

export interface EmployerMatch {
  id: string;
  name: string;
  confidence: 'exact' | 'high' | 'medium' | 'low';
  distance?: number;
}

// Simple string similarity function for employer matching
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

export function normalizeCompanyName(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/PTY\.?\s*LTD\.?/gi, 'PTY LTD')
    .replace(/LIMITED/gi, 'LTD')
    .replace(/PROPRIETARY/gi, 'PTY')
    .replace(/\bAND\b/gi, '&')
    .replace(/[^\w\s&]/g, '');
}

export function findBestEmployerMatch(
  companyName: string, 
  existingEmployers: Array<{id: string, name: string}>
): EmployerMatch | null {
  const normalizedSearchName = normalizeCompanyName(companyName);
  
  let bestMatch: EmployerMatch | null = null;
  let bestScore = 0;
  
  for (const employer of existingEmployers) {
    const normalizedEmployerName = normalizeCompanyName(employer.name);
    
    // Check for exact match first
    if (normalizedSearchName === normalizedEmployerName) {
      return {
        id: employer.id,
        name: employer.name,
        confidence: 'exact',
        distance: 0
      };
    }
    
    // Calculate similarity
    const similarity = calculateSimilarity(normalizedSearchName, normalizedEmployerName);
    
    if (similarity > bestScore && similarity > 0.7) {
      bestScore = similarity;
      const confidence = similarity >= 0.95 ? 'high' : 
                       similarity >= 0.85 ? 'medium' : 'low';
      
      bestMatch = {
        id: employer.id,
        name: employer.name,
        confidence,
        distance: 1 - similarity
      };
    }
  }
  
  return bestMatch;
}

export function cleanPhoneNumber(phone: string): string {
  if (!phone) return phone;
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it starts with 04, it's an Australian mobile
  if (cleaned.startsWith('04') && cleaned.length === 10) {
    return cleaned;
  }
  
  // If it starts with +614, convert to 04
  if (cleaned.startsWith('+614') && cleaned.length === 13) {
    return '04' + cleaned.slice(4);
  }
  
  return cleaned;
}

export function processWorkerRow(row: Record<string, string>): ProcessedWorkerData | null {
  const companyName = row['CompanyName'] || row['Company Name'] || row['company_name'];
  const memberSurname = row['MemberSurname'] || row['Member Surname'] || row['surname'];
  const memberFirstName = row['MemberFirstName'] || row['Member First Name'] || row['first_name'];
  const mobile = row['Mobile'] || row['mobile'] || row['mobile_phone'];
  const memberNumber = row['MemberNumber'] || row['Member Number'] || row['member_number'];
  const comments = row['Comments'] || row['comments'];
  
  // Skip rows with missing essential data
  if (!companyName || !memberSurname || !memberFirstName) {
    return null;
  }
  
  // Determine union membership status from comments or member number
  let unionStatus: 'member' | 'non_member' | 'potential' | 'declined' = 'potential';
  if (memberNumber && memberNumber.trim() !== '') {
    unionStatus = 'member';
  } else if (comments && comments.toLowerCase().includes('non-member')) {
    unionStatus = 'non_member';
  } else if (comments && comments.toLowerCase().includes('declined')) {
    unionStatus = 'declined';
  }
  
  return {
    first_name: memberFirstName.trim(),
    surname: memberSurname.trim(),
    mobile_phone: mobile ? cleanPhoneNumber(mobile) : undefined,
    union_membership_status: unionStatus,
    company_name: companyName.trim(),
    organizer_number: row['OrganiserNumber'] || row['Organiser Number'],
    organizer_surname: row['OrganiserSurname'] || row['Organiser Surname'],
    organizer_first_name: row['OrganiserFirstName'] || row['Organiser First Name'],
    member_number: memberNumber?.trim(),
    comments: comments?.trim(),
    source_file: row['SourceFile'] || row['Source File'] || row['source_file']
  };
}

export function processWorkerData(csvData: any[]): ProcessedWorkerData[] {
  return csvData
    .map(row => processWorkerRow(row))
    .filter((row): row is ProcessedWorkerData => row !== null);
}