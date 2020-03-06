import {IHistoryTransport, IMethodTransport} from "./Types";
import {RequestController} from "./RequestController";
import fetch from "node-fetch";
import {Constants} from "./Constants";

export class TestController extends RequestController {

	public static async getRepo(): Promise<string> {
		return JSON.parse(await (await fetch(`/responses/${Constants.TEST}.json`)).text()).repo;
	}

	public static async getFile(): Promise<string> {
		return JSON.parse(await (await fetch(`/responses/${Constants.TEST}.json`)).text()).file;
	}

	public static async getMethod(): Promise<IMethodTransport> {
		return JSON.parse(await (await fetch(`/responses/${Constants.TEST}.json`)).text()).method;
	}

	public async listFiles(gitUrl: string, sha: string): Promise<string[]> {
		let files: any = JSON.parse(await (await fetch(`/responses/${Constants.TEST}.json`)).text()).files;
		if (typeof files === "string") {
			files = JSON.parse(await (await fetch(`/responses/${files}.json`)).text()).files;
		}
		(files as string[]).sort();
		return files as string[];
	}
	public async listMethods(gitUrl: string, sha: string, filePath: string): Promise<IMethodTransport[]> {
		let methods: any = JSON.parse(await (await fetch(`/responses/${Constants.TEST}.json`)).text()).methods;
		if (typeof methods === "string") {
			methods = JSON.parse(await (await fetch(`/responses/${methods}.json`)).text()).methods;
		}
		return methods as IMethodTransport[];
	}
	public async getHistory(gitUrl: string, sha: string, filePath: string, startLine: number, methodName: string): Promise<IHistoryTransport> {
		return JSON.parse(await (await fetch(`/responses/${Constants.TEST}.json`)).text()).history;
	}
}
