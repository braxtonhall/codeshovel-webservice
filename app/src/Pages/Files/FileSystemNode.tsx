import {Constants} from "../../Constants";
import {FadeableElement, IFadeableElementProps, IFadeableElementState} from "../../FadeableElement";

export class FileSystemNode {
	// TODO pull up shared functionality of File and Directory
}

export abstract class ReactFileSystemNode<P extends IFadeableElementProps, S extends IFadeableElementState> extends FadeableElement<P, S>{
	// TODO pull up share functionality of ReactFile and ReactDirectory
	protected static getFontSize(s: string, modifier: number = 1): string {
		return (100 / Math.max(s.length, 45) * Constants.FILE_SYSTEM_TEXT_SIZE * modifier) + "px";
	}
}
