import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, GraduationCap } from "lucide-react";

const links = [
  { label: "myJKU", href: "https://my.jku.at/" },
  { label: "KUSSS", href: "https://kusss.jku.at/" },
  { label: "Moodle", href: "https://moodle.jku.at/" },
  { label: "KUSSS help", href: "https://www.jku.at/studium/studierende/kusss/kusss-faq/" },
];

export default function JkuLinks({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={iconOnly ? "icon" : "default"}>
          <GraduationCap />
          {!iconOnly && "JKU links"}
          <span className="sr-only">Open JKU links</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>JKU services</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {links.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <a href={link.href} target="_blank" rel="noreferrer" className="justify-between">
              {link.label}
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
