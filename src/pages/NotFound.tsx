import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <span className="font-display text-[120px] font-bold text-primary/20">404</span>
        <h1 className="font-display text-2xl font-bold mb-4 -mt-8">Không tìm thấy trang</h1>
        <p className="text-muted-foreground mb-8">Trang này không tồn tại.</p>
        <Button asChild size="lg" className="gradient-primary border-0">
          <Link to="/"><Home className="mr-2 h-4 w-4" />Trang chủ</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
