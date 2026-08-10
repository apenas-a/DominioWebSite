interface PageHeaderProps {
  title: React.ReactNode;
  subtitle: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <div className="relative pt-28 pb-12 md:pt-36 md:pb-20 overflow-hidden flex flex-col items-center justify-center text-center">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />
      
      {/* Decorative flares */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-accent/6 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-molten/6 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 px-4 max-w-4xl mx-auto">
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight mb-4 text-foreground">
          {title}
        </h1>
        <div className="w-20 h-[2px] gradient-molten mx-auto mb-5" />
        <p className="text-foreground/55 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default PageHeader;
