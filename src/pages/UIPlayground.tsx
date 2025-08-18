import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function UIPlayground() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">UI Playground</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="space-x-2 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="filled">Filled</Button>
              <Button variant="tinted">Tinted</Button>
              <Button variant="plain">Plain</Button>
              <Button variant="outline">Outline</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Text field" />
            <Textarea placeholder="Textarea" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one">One</SelectItem>
                <SelectItem value="two">Two</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-3">
              <Switch />
              <Slider defaultValue={[40]} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ["bg", "bg-background"],
              ["bg-elev", "bg-secondary"],
              ["surface", "bg-card"],
              ["accent", "bg-primary"],
            ].map(([name, cls]) => (
              <div key={name} className="space-y-1">
                <div className={`h-12 rounded-md border ${cls}`}></div>
                <div className="text-xs text-muted-foreground">{name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

