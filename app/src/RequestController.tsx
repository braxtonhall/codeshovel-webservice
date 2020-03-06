// import {Constants} from "./Constants";
import {
	EmptyError,
	IHistoryTransport,
	IManifest,
	IMethodTransport,
	InternalError,
	ServerBusyError
} from "./Types";

export class RequestController {
	private static readonly server: string = new URL(window.location.href).origin; // Constants.SERVER_ADDRESS;

	public static async getManifest(): Promise<IManifest> {
    //	return JSON.parse(await (await fetch(Constants.MANIFEST_PATH)).text());
		return JSON.parse(await (await fetch(RequestController.server)).text());
	}

	public static async getAuthorUrl(org: string, repo: string, sha: string): Promise<string> {
		try {
			const response: any = await RequestController.request(`https://api.github.com/repos/${org}/${repo}/commits/${sha}`, {});
			return response.author.html_url as string;
		} catch (err) {
			throw new Error("Wasn't able to get the required information from GitHub");
		}
	}

	public static async getAuthorAvatarUrl(user: string): Promise<string> {
		const defaultUrl: string = "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";
		let url;
		try {
			const response: any = await RequestController.request(`https://api.github.com/users/${user}`, {});
			url = response.avatar_url as string | undefined;
		} catch (err) {
			// Suppress
		}
		return url || defaultUrl;
	}

	public async listFiles(gitUrl: string, sha: string): Promise<string[]> {
		console.info(`listFiles: [getUrl: ${gitUrl}, sha: ${sha}]`);
		const url = RequestController.server + "/listFiles";
		const qs: {[key: string]: string | boolean} = {
			gitUrl,
			sha,
		};
		const files: string[] = (await RequestController.request(url, qs)).sort();
		if (files.length === 0) {
			throw new EmptyError("No supported files found in this repo.")
		} else {
			return files;
		}
	}

	public async listMethods(gitUrl: string, sha: string, filePath: string): Promise<IMethodTransport[]> {
		const url = RequestController.server + "/listMethods";
		const qs: {[key: string]: string | boolean} = {
			gitUrl,
			sha,
			filePath
		};
		const methods: IMethodTransport[] = (await RequestController.request(url, qs)).sort((a: IMethodTransport, b: IMethodTransport) => {
			if (a.startLine < b.startLine) {
				return -1;
			} else if (a.startLine > b.startLine) {
				return 1;
			} else {
				return 0;
			}
		});
		if (methods.length === 0) {
			throw new EmptyError("No methods found in this file.")
		} else {
			return methods;
		}
	}

	public async getHistory(gitUrl: string, sha: string, filePath: string, startLine: number, methodName: string, noClone: boolean): Promise<IHistoryTransport> {
		const url = RequestController.server + "/getHistory";
		const qs: {[key: string]: string | boolean | number} = {
			gitUrl,
			sha,
			filePath,
			startLine,
			methodName,
			noClone
		};
		const history: IHistoryTransport = await RequestController.request(url, qs);
		if (Object.keys(history).length === 0) {
			throw new EmptyError("No changes found in this method.")
		} else {
			return history;
		}
	}

	public static async echo(msg: string = "echo"): Promise<string> {
		const url = RequestController.server + "/echo";
		const qs: {[key: string]: string} = { msg };
		return await RequestController.request(url, qs);
	}

	private static async request(url: string, qs: {[key: string]: string | boolean | number}): Promise<any> {
		let status = 400;
		try {
			const urlObject: URL = new URL(url);
			for (const [key, value] of Object.entries(qs)) {
				urlObject.searchParams.append(key, value.toString());
			}
			// @ts-ignore
			let res = await fetch(urlObject, {mode: 'cors'});
			status = res.status;
			if (status === 200) {
				return await res.json();
			}
		} catch (e) {
			// Keep other com.historyfinder.rest.errors in method
		}
		if (status === 503) {
			throw new ServerBusyError("RequestController not able to handle request.");
		} else {
			throw new InternalError("RequestController not able to handle request.");
		}
	}
}
