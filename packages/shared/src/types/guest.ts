export interface GuestPublic {
id: string;
fullName: string;
company?: string;
maskedNik?: string;
maskedPhone?: string;
maskedEmail?: string;
}

export interface VisitPublic {
id: string;
guestName: string;
company?: string;
destination: string;
purpose: string;
queueNumber: string;
status: 'WAITING' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';
checkInAt: string;
}
