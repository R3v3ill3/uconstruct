import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heading, Text } from "@/components/ui/text"

export default function UIPlayground() {
  return (
    <div className="p-6 space-y-8">
      <Heading role="largeTitle" as="h1">UI Playground</Heading>
      <Text role="subheadline" className="text-muted-foreground">Tokens and core primitives</Text>

      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent className="space-x-3 space-y-3">
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="filled">Filled</Button>
            <Button variant="tinted">Tinted</Button>
            <Button variant="plain">Plain</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="TextField (44px min)" />
          <Textarea placeholder="Textarea (comfortable)" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="one">
            <TabsList>
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
            </TabsList>
            <TabsContent value="one" className="pt-2">
              <Text>First tab</Text>
            </TabsContent>
            <TabsContent value="two" className="pt-2">
              <Text>Second tab</Text>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

