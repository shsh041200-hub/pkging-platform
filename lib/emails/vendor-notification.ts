export interface VendorNotificationParams {
  vendorName: string;
  vendorSlug: string;
  buyerEmail: string;
  buyerCompany?: string;
  quantityDesc?: string;
  deadlineDate?: string;
  requirements?: string;
}

export function vendorNotificationSubject(params: VendorNotificationParams): string {
  const senderLabel = params.buyerCompany || params.buyerEmail;
  return `[Packlinx] 새 견적 요청 — ${senderLabel} 님이 문의하셨습니다`;
}

export function vendorNotificationHtml(params: VendorNotificationParams): string {
  const {
    vendorName,
    vendorSlug,
    buyerEmail,
    buyerCompany,
    quantityDesc,
    deadlineDate,
    requirements,
  } = params;

  const displayCompany = buyerCompany || '(미입력)';
  const displayQuantity = quantityDesc || '(미입력)';
  const displayDeadline = deadlineDate || '(미입력)';
  const displayRequirements = requirements || '(미입력)';

  return `안녕하세요, ${vendorName} 담당자님

Packlinx를 통해 새 견적 요청이 접수되었습니다.

■ 요청자 정보
- 회사명: ${displayCompany}
- 연락처: ${buyerEmail}

■ 요청 내용
- 수량/규격: ${displayQuantity}
- 납기: ${displayDeadline}
- 세부 요구사항:
  ${displayRequirements}

■ 회신 방법
위 이메일(${buyerEmail})로 직접 연락해 주세요.
Packlinx는 견적 협의 과정에 개입하지 않으며, 업체와 구매자 간 직접 소통을 지원합니다.

---
Packlinx | 한국 포장재 B2B 디렉터리
https://packlinx.com

본 메일은 packlinx.com 견적 요청 폼을 통해 발송된 자동 알림입니다.
수신 거부 또는 업체 정보 수정은 packlinx.com/companies/${vendorSlug}에서 가능합니다.`;
}
