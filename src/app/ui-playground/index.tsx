import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Toolbar } from "@/components/Toolbar"
import { Heading, Text } from "@/components/ui/text"

export default function UIPlayground() {
  return (
    <div className="p-6 space-y-8">
      <Toolbar title="UI Playground" />
      <Heading role="title2" as="h2">Tokens and core primitives</Heading>

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

      <Card>
        <CardHeader>
          <CardTitle>Segmented Control</CardTitle>
        </CardHeader>
        <CardContent>
          <ToggleGroup type="single" defaultValue="a">
            <ToggleGroupItem value="a">One</ToggleGroupItem>
            <ToggleGroupItem value="b">Two</ToggleGroupItem>
            <ToggleGroupItem value="c">Three</ToggleGroupItem>
          </ToggleGroup>
        </CardContent>
      </Card>
    </div>
  )
}

