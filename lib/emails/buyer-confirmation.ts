export interface BuyerConfirmationParams {
  buyerEmail: string;
  buyerCompany?: string;
  vendorNames: string[];
  quantityDesc?: string;
  deadlineDate?: string;
}

export function buyerConfirmationSubject(params: BuyerConfirmationParams): string {
  return `[Packlinx] 견적 요청이 ${params.vendorNames.length}개 업체에 전달되었습니다`;
}

export function buyerConfirmationHtml(params: BuyerConfirmationParams): string {
  const { buyerEmail, buyerCompany, vendorNames, quantityDesc, deadlineDate } = params;

  const greeting = buyerCompany ? ` ${buyerCompany} 담당자님` : '';
  const vendorList = vendorNames.map((name) => `• ${name}`).join('\n');
  const displayQuantity = quantityDesc || '(미입력)';
  const displayDeadline = deadlineDate || '(미입력)';

  return `안녕하세요${greeting}

견적 요청이 정상적으로 접수되어 아래 업체(들)에 전달되었습니다.

■ 요청 전달 업체 (${vendorNames.length}개)
${vendorList}

■ 다음 단계
업체에서 직접 이메일(${buyerEmail})로 회신을 드릴 예정입니다.
통상 1~3 영업일 내에 연락이 오며, 회신이 없을 경우 packlinx.com에서 업체에 직접 연락해 주세요.

■ 요청 내용 요약
- 수량/규격: ${displayQuantity}
- 납기: ${displayDeadline}

감사합니다.

---
Packlinx | 한국 포장재 B2B 디렉터리
https://packlinx.com
문의: packlinx.com을 통해 업체에 직접 연락 가능합니다.`;
}
