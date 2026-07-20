interface PageHeaderProps {
  title: React.ReactNode;
  subtitle: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <div className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden flex flex-col items-center justify-center text-center">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />
      
      {/* Decorative molten flares */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-molten/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 px-4 max-w-4xl mx-auto">
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight mb-4 text-foreground">
          {title}
        </h1>
        <div className="w-24 h-1 gradient-molten mx-auto mb-6" />
        <p className="text-foreground/70 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-light">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default PageHeader;
