// Home fall-back page

import { Heading, Text } from "@/components/ui/text";

const Index = () => {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="text-center px-6">
				<Heading role="largeTitle" as="h1" className="mb-3">Welcome</Heading>
				<Text role="subheadline" className="text-muted-foreground">Start building your project here.</Text>
			</div>
		</div>
	);
};

export default Index;