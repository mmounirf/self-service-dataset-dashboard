import { Button, MantineProvider } from "@mantine/core";
import { IconEyeBolt } from "@tabler/icons-react";
import theme from "./theme";

function App() {
	return (
		<MantineProvider theme={theme}>
			<Button size="md" leftSection={<IconEyeBolt />}>
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
