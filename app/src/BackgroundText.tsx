import * as React from "react";
import {ReactNode} from "react";
import {Pages} from "./Enums";
import {IMethodTransport} from "./Types";
import {Constants} from "./Constants";

export class BackgroundText extends React.Component<IBackgroundTextProps, {}> {
	private readonly fadeOutTime: number = 700;

	private getBlur(): string {
		return `blur(${Math.floor(Math.sqrt(this.props.windowArea) * Constants.BLUR_FACTOR)}px)`;
	}

	public render(): ReactNode {
		const filter: string = this.getBlur();
		return(
			<div
				style={{
					whiteSpace: "nowrap",
					textAlign: "left",
				}}
			>
				<div
					style={{
						position: "absolute",
						top: "15%",
						left: "2%",
						font: "900% \"Courier New\", Futura, sans-serif",
						opacity: this.props.page >= Pages.FILES && this.props.page < Pages.ABOUT ? Constants.BACKGROUND_TEXT_OPACITY : 0,
						filter,
						transition: this.fadeOutTime + "ms ease-in-out",
						fontStyle: "italic",
					}}
				>
					{(this.props.repo.split("/").pop() as string).replace(".git", "")}
				</div>
				<div
					style={{
						position: "absolute",
						top: "57%",
						left: "10%",
						font: "800% \"Courier New\", Futura, sans-serif",
						opacity: this.props.page >= Pages.FILES && this.props.page < Pages.ABOUT ? Constants.BACKGROUND_TEXT_OPACITY : 0,
						filter,
						transition: this.fadeOutTime + "ms ease-in-out",
						fontStyle: "italic",
					}}
				>
					{this.props.file.split("/").pop()}
				</div>
				<div
					style={{
						position: "absolute",
						top: "80%",
						left: "60%",
						font: "650% \"Courier New\", Futura, sans-serif",
						opacity: this.props.page >= Pages.FILES && this.props.page < Pages.ABOUT ? Constants.BACKGROUND_TEXT_OPACITY : 0,
						filter,
						transition: this.fadeOutTime + "ms ease-in-out",
						fontStyle: "italic",
					}}
				>
					{this.props.sha === "HEAD" ? "" : this.props.sha}
				</div>
				<div
					style={{
						position: "absolute",
						top: "40%",
						left: "35%",
						font: "700% \"Courier New\", Futura, sans-serif",
						opacity: this.props.page >= Pages.METHODS && this.props.page < Pages.ABOUT ? Constants.BACKGROUND_TEXT_OPACITY : 0,
						filter,
						transition: this.fadeOutTime + "ms ease-in-out",
						fontStyle: "italic",
					}}
				>
					{this.props.method.methodName}
				</div>
			</div>
		);
	}
}

export interface IBackgroundTextProps {
	page: Pages;
	file: string;
	method: IMethodTransport;
	sha: string;
	repo: string;
	windowArea: number;
}
