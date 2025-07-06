import { Button, MantineProvider } from "@mantine/core";
import { IconEyeBolt } from "@tabler/icons-react";
import theme from "./theme";
import FileWorker from "./web-workers/fileWorker?worker";

function App() {
	const worker = new FileWorker();

	worker.onmessage = (event) => {
		console.log("Worker response:", event.data);
	};

	return (
		<MantineProvider theme={theme}>
			<Button
				size="md"
				leftSection={<IconEyeBolt />}
				onClick={() =>
					worker.postMessage({
						type: "example",
						payload: "Hello, Worker!",
					})
				}
			>
				Click Me
			</Button>
			<div>
				<h1>Self-service Dataset Dashboard</h1>
				<p>Welcome to the Self-service Dataset Dashboard!</p>
				<p>This is a prototype UI built with Mantine.</p>
				<p>Feel free to explore and customize it further.</p>
			</div>
		</MantineProvider>
	);
}

export default App;
