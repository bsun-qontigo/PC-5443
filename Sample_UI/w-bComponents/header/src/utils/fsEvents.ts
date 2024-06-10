import { tryEvent } from '@axioma-api/fs';

export function fsUploadClicked(): void {
	send('Upload_Clicked');
}

export function fsUploadClosed(): void {
	send('Upload_Closed');
}

export function fsUserClicked(): void {
	send('User_Clicked');
}

export function fsSingleUploadClicked(): void {
	send('Single_Upload_Clicked');
}

export function fsFilesUploaded(number: string): void {
	send('Files_Uploaded_', number);
}

export function fsWrongFiletypeUploaded(filetype: string): void {
	send('Files_Uploaded_', filetype);
}

type Actions = 'Single_Upload_Clicked' | 'Upload_Closed' | 'User_Clicked' | 'Upload_Clicked' | 'Files_Uploaded_';
function send(action: Actions, extra?: string) {
	tryEvent('Wealth', { action: `${action}${extra}` });
}