import { Hash, LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface StatsCardProps {
  title: string;
  description: string;
  value: number;
  total?: number;
  children?: ReactNode;
  Icon?: LucideIcon;
}

const StatsCard = ({
  title,
  description,
  value,
  total,
  children,
  Icon,
}: StatsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}{" "}
          {Icon ? (
            <Icon size={24} className="text-muted-foreground" />
          ) : (
            <Hash size={24} className="text-muted-foreground" />
          )}
        </CardTitle>
        <CardDescription>
          <p className="text-muted-foreground">{description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col">
        <p className="text-4xl font-bold">
          {value}{" "}
          {total && (
            <span className="text-lg text-muted-foreground">/ {total}</span>
          )}
        </p>
        {children}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
