import { Button } from "./ui/button";

export default function Footer() {
	return (
		<footer
			className="h-28 w-full flex flex-row justify-center items-center text-white"
			style={{
				background:
					"repeating-conic-gradient(from 30deg,#0000 0 120deg,#c0ccf2 0 180deg) 36px 20.772px, repeating-conic-gradient(from 30deg,#264bc0 0 60deg,#6a87e2 0 120deg,#c0ccf2 0 180deg)",
				backgroundSize: "72px 42px",
			}}>
			<div className="glass flex flex-row justify-center items-center p-3">
				<h2>Made by Tim Toller with ❤️</h2>
				<Button variant="link" asChild className="p-2 text-white">
					<a href="https://github.com/TimToller/study-planner">GitHub</a>
				</Button>
			</div>
		</footer>
	);
}
