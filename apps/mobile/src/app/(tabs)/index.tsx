import { Ionicons } from "@expo/vector-icons";
import { Avatar, Button, Card, Chip, Typography as HeroTypography } from "heroui-native";
import type { JSX } from "react";
import { useState } from "react";
import { ScrollView, View, useWindowDimensions } from "react-native";

type IconName = keyof typeof Ionicons.glyphMap;
const Typography = Object.assign(HeroTypography, {
  Caption: HeroTypography,
  Title: HeroTypography.Heading,
});

const expenseRows = [
  { label: "Groceries", active: [2, 3, 6] },
  { label: "Lifestyle", active: [1, 3, 4, 5, 7] },
  { label: "Essentials", active: [0, 1, 2, 4, 5] },
];
const incomes = [44, 78, 118, 172];

function Icon({ name, size = 18 }: { name: IconName; size?: number }): JSX.Element {
  return <Ionicons name={name} size={size} color="#111827" />;
}

function IconButton({ label, name }: { label: string; name: IconName }): JSX.Element {
  return (
    <Button isIconOnly variant="secondary" accessibilityLabel={label} className="size-11 rounded-2xl">
      <Icon name={name} />
    </Button>
  );
}

function BrandMark(): JSX.Element {
  return (
    <View className="size-9 flex-row flex-wrap gap-1 rounded-xl bg-accent p-1.5">
      <View className="size-2.5 rounded-sm bg-white" /><View className="size-2.5 rounded-sm bg-white" />
      <View className="size-2.5 rounded-sm bg-white" /><View className="size-2.5 rounded-sm bg-white" />
    </View>
  );
}

function ExpenseMatrix(): JSX.Element {
  return (
    <Card className="gap-6 rounded-[28px] p-5" variant="default">
      <View className="flex-row items-center justify-between gap-3">
        <View><Card.Title className="text-lg">Spending rhythm</Card.Title><Card.Description>Last 7 days</Card.Description></View>
        <Chip size="sm" variant="secondary">Weekly</Chip>
      </View>
      <View className="gap-4">
        {expenseRows.map((row, rowIndex) => (
          <View key={row.label} className="flex-row items-center gap-3">
            <Typography.Caption className="w-20 text-muted">{row.label}</Typography.Caption>
            <View className="flex-1 flex-row justify-between gap-1.5">
              {Array.from({ length: 7 }, (_, index) => {
                const active = row.active.includes(index);
                return <View key={index} className={`size-7 rounded-full ${active ? ((index + rowIndex) % 2 === 0 ? "bg-accent" : "bg-foreground") : "bg-surface-tertiary"}`} />;
              })}
            </View>
          </View>
        ))}
      </View>
      <View className="ml-[92px] flex-row justify-between px-1">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <Typography.Caption key={`${day}-${index}`} className="text-muted">{day}</Typography.Caption>)}</View>
      <View className="flex-row items-end justify-between"><View><Typography.Caption className="text-muted">This week</Typography.Caption><Typography.Title className="text-3xl font-semibold tracking-tight">$ 17.3K</Typography.Title></View><Chip size="sm" variant="soft" color="success">+8.4%</Chip></View>
    </Card>
  );
}

function IncomeChart(): JSX.Element {
  return (
    <Card className="gap-6 rounded-[28px] p-5" variant="default">
      <View className="flex-row items-center justify-between"><View><Card.Title className="text-lg">Income sources</Card.Title><Card.Description>Monthly comparison</Card.Description></View><IconButton label="More options" name="ellipsis-horizontal" /></View>
      <View className="flex-row items-end justify-between gap-4">
        <View className="gap-1"><Typography.Caption className="text-muted">Available now</Typography.Caption><Typography.Title className="text-3xl font-semibold tracking-tight">$ 7.72K</Typography.Title><Chip size="sm" variant="soft" color="success" className="self-start">+73.6%</Chip></View>
        <View className="h-44 flex-1 flex-row items-end justify-end gap-2">
          {incomes.map((height, index) => <View key={height} className="flex-1 items-center justify-end gap-2"><View className={`w-full rounded-t-2xl ${index === 3 ? "bg-accent" : "bg-foreground"}`} style={{ height }} /><Typography.Caption className="text-muted">{['Apr', 'May', 'Jun', 'Jul'][index]}</Typography.Caption></View>)}
        </View>
      </View>
      <View className="flex-row gap-2"><Chip size="sm" variant="tertiary">Salary</Chip><Chip size="sm" variant="tertiary">Freelance</Chip><Chip size="sm" variant="tertiary">Investments</Chip></View>
    </Card>
  );
}

function BalanceCard(): JSX.Element {
  return (
    <Card className="gap-5 rounded-[28px] p-5" variant="default">
      <View className="flex-row items-center justify-between"><View><Card.Title className="text-lg">Balance pulse</Card.Title><Card.Description>Against weekly goal</Card.Description></View><IconButton label="Open balance details" name="arrow-up-right-box" /></View>
      <View className="items-center gap-4 py-2"><View className="h-28 w-56 flex-row items-end justify-center gap-1 overflow-hidden rounded-t-full bg-surface-secondary px-4 pb-3">{Array.from({ length: 18 }, (_, index) => <View key={index} className={`w-2.5 rounded-t-full ${index < 12 ? "bg-accent" : "bg-surface-tertiary"}`} style={{ height: 26 + Math.sin((index / 17) * Math.PI) * 62 }} />)}<View className="absolute bottom-4 items-center"><Typography.Title className="text-2xl font-semibold">22%</Typography.Title><Typography.Caption className="text-muted">from yesterday</Typography.Caption></View></View><Chip size="sm" variant="soft">Profit is 22% above last week</Chip></View>
    </Card>
  );
}

function MasteryCard(): JSX.Element {
  return (
    <Card className="overflow-hidden rounded-[28px] bg-foreground p-5" variant="transparent">
      <View className="absolute -right-12 -top-20 size-52 rounded-full bg-accent opacity-30" /><View className="absolute right-3 top-3 size-32 rounded-full border-[20px] border-white/10" />
      <View className="z-10 gap-5"><Chip size="sm" variant="soft" color="success" className="self-start">New lesson</Chip><View className="gap-2"><Typography.Title className="max-w-64 text-3xl font-semibold leading-9 text-white">Build your money system.</Typography.Title><Typography.Paragraph className="max-w-56 text-white/70">A five-day financial reset, made for real life.</Typography.Paragraph></View><Button className="self-start" variant="primary"><Button.Label>Start class</Button.Label><Ionicons name="arrow-forward" size={17} color="white" /></Button></View>
    </Card>
  );
}

function ReceivedCard(): JSX.Element {
  return (
    <Card className="gap-4 rounded-[28px] p-5" variant="default">
      <View className="flex-row items-center justify-between"><View className="size-11 items-center justify-center rounded-full bg-success-soft"><Icon name="arrow-down" /></View><Chip size="sm" variant="soft" color="success">Today</Chip></View>
      <View className="gap-1"><Typography.Caption className="text-muted">Income received</Typography.Caption><Typography.Title className="text-3xl font-semibold tracking-tight">$ 532,921</Typography.Title></View><Typography.Paragraph className="text-muted">12% more than this time last month</Typography.Paragraph>
    </Card>
  );
}

export default function HomeTab(): JSX.Element {
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [activeNav, setActiveNav] = useState("Overview");
  const navigation = [["Overview", "grid-outline"], ["Spending", "pie-chart-outline"], ["Plans", "sparkles-outline"], ["Profile", "person-outline"]] as const;

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="gap-6 px-4 pb-32 pt-5" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between"><View className="flex-row items-center gap-3"><BrandMark /><Typography.Title className="text-xl font-semibold tracking-tight">Nuvio</Typography.Title></View><View className="flex-row items-center gap-2"><IconButton label="Notifications" name="notifications-outline" /><Avatar size="md" variant="soft" color="accent"><Avatar.Fallback>DA</Avatar.Fallback></Avatar></View></View>
        <View className="gap-1"><Typography.Caption className="font-semibold uppercase tracking-widest text-accent">Monday, 12 August</Typography.Caption><Typography.Title className="text-4xl font-semibold leading-[44px] tracking-tight">Good morning, Daniel.</Typography.Title><Typography.Paragraph className="text-muted">Here is the money story you need today.</Typography.Paragraph></View>
        {isWide ? <View className="flex-row flex-wrap gap-2">{navigation.map(([item]) => <Button key={item} size="sm" variant={activeNav === item ? "primary" : "secondary"} onPress={() => setActiveNav(item)}>{item}</Button>)}</View> : null}
        <View className={`gap-5 ${isWide ? "flex-row" : ""}`}><View className={isWide ? "flex-[1.35] gap-5" : "gap-5"}><ExpenseMatrix /><IncomeChart /></View><View className={isWide ? "flex-1 gap-5" : "gap-5"}><MasteryCard /><View className={isWide ? "flex-row gap-5" : "gap-5"}><View className="flex-1"><ReceivedCard /></View><View className="flex-1"><BalanceCard /></View></View></View></View>
      </ScrollView>
      {!isWide ? <Card className="absolute bottom-5 left-4 right-4 flex-row justify-between rounded-[24px] px-3 py-2" variant="secondary">{navigation.map(([label, icon]) => <Button key={label} isIconOnly variant={activeNav === label ? "primary" : "ghost"} accessibilityLabel={label} onPress={() => setActiveNav(label)} className="size-12 rounded-2xl"><Icon name={icon} /></Button>)}</Card> : null}
    </View>
  );
}
