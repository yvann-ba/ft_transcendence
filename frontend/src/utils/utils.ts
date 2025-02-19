export function getCookie(name: string) : string | null {

	console.log('cookielo:', document.cookie);

    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}