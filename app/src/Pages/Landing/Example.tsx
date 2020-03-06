import {IManifestEntry} from "../../Types";
import {Constants} from "../../Constants";
import * as React from "react";
import {ReactNode} from "react";
import {Changes} from "../../Enums";

export class Example extends React.Component<IReactExampleProps, IReactExampleState> {
	private readonly example : IManifestEntry;
	private readonly className: string;
	private readonly gridTemplateColumns: string;
	private readonly changePreview: ReactNode[];

	constructor(props: IReactExampleProps) {
		super(props);
		if (this.props.example) {
			this.example = this.props.example;
			this.className = `InvertedSubtleButton ExampleRow`;
		} else {
			this.example = {
				repoShort: "org/repo",
				repo: "",
				filePath: "",
				method: {...Constants.DEFAULT_METHOD, methodName: "method"},
				sha: "",
				historyShort: [
					Changes.FILE_RENAME,
					Changes.MOV_FROM_FILE,
					Changes.EXCEPS_CHANGE,
					Changes.PARAM_CHANGE,
					Changes.RETURN_CHANGE,
					Changes.BODY_CHANGE,
					Changes.RENAME,
					Changes.INTRODUCED
				]
			};
			this.className = `HoverOpacityUp SampleExampleRow`;
		}
		this.gridTemplateColumns = new Array(this.example.historyShort.length).fill("1fr").join(" ");
		this.changePreview = this.example.historyShort.map((change: Changes, i: number) => <div key={`${this.example.method.longName}-${i}`} className={change}/>);
		this.handleClick = this.handleClick.bind(this);
		this.mouseDown = this.mouseDown.bind(this);
		this.tellParent = this.tellParent.bind(this);
	}

	private getWidth(s: string): string {
		if (this.props.windowWidth < Constants.MOBILE_WIDTH) {
			return this.props.windowWidth + "px";
		} else {
			return (10 * Math.log(Math.max(10, s.length)) * Constants.EXAMPLE_ROW_WIDTH) + "px";
		}
	}

	private static getFontSize(s: string, modifier: number = 1): string {
		return (10 / (Math.log(Math.max(s.length, 10))) * Constants.EXAMPLE_TEXT_SIZE * modifier) + "px";
	}

	private handleClick(): void {
		this.props.tellParent(this.example);
	}

	private mouseDown(): void {

	}

	private tellParent(): void {

	}

	public render(): ReactNode {
		const display: string = `${this.example.repoShort}->${this.example.method.methodName}`;
		return(
				<div
					style={{display: "block"}}
				>
					<div
						className={this.className}
						style={{
							position: "relative",
							marginTop: "3px",
							marginBottom: "3px",
							height: "40px",
							width: this.getWidth(display),
							overflow: "hidden",
							zIndex: 9999,
							fontSize: Example.getFontSize(display),
							pointerEvents: "auto"
						}}
						onClick={this.handleClick}
						onMouseDown={this.mouseDown}
					>
						{display}
						<div style={{
							height: "3px",
							width: "100%",
							position: "absolute",
							bottom: "0",
							display: "grid",
							gridTemplateColumns: this.gridTemplateColumns,
						}}>
							{this.changePreview}
						</div>
					</div>
				</div>
		);
	}
}

export interface IReactExampleProps {
	example: IManifestEntry | false;
	tellParent: (example: IManifestEntry) => void;
	windowWidth: number;
}

export interface IReactExampleState {

}