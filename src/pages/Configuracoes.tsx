import { User, Bell, Shield, Trash2, Camera, Loader2, LogOut } from 'lucide-react';
import { Button } from '../components/ui/Base';
import { Input } from '../components/ui/Form';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ExamType } from '../types';
import { cn } from '../components/ui/Base';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Configuracoes() {
  const { currentEssay, setExam } = useAppStore();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem('temp_auth');
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar no canvas
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64String = canvas.toDataURL('image/jpeg', 0.6); // Compressão agressiva

          // Salvar no Supabase
          supabase.auth.updateUser({
            data: { avatar_url: base64String }
          }).finally(() => {
            setIsUploading(false);
          });
        } else {
          setIsUploading(false);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl md:mx-auto w-full">
      <div className="mb-8">
        <p className="text-text-secondary text-sm">Gerencie suas preferências e dados de conta.</p>
      </div>

      <div className="space-y-12">
        {/* Perfil */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <User size={20} className="text-accent" />
            <h3 className="text-lg font-bold text-text-primary">Perfil</h3>
          </div>
          <div className="bg-white border border-border rounded-[10px] p-8 space-y-6">
            
            {/* Avatar Upload */}
            <div className="flex items-center gap-6 pb-6 border-b border-border/50">
              <div className="relative w-20 h-20 rounded-full bg-bg border border-border flex items-center justify-center overflow-hidden shrink-0">
                {isUploading ? (
                  <Loader2 size={24} className="text-accent animate-spin" />
                ) : user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-text-secondary" />
                )}
              </div>
              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                />
                <Button 
                  variant="outline" 
                  className="mb-2" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Camera size={16} className="mr-2" />
                  Trocar foto
                </Button>
                <p className="text-xs text-text-muted">Recomendado: imagem quadrada (ex: 400x400). Máx: 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Nome completo" 
                defaultValue={
                  user?.user_metadata?.full_name || 
                  user?.user_metadata?.name || 
                  (user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user?.user_metadata?.last_name || ''}`.trim() : "Usuário")
                } 
              />
              <Input label="E-mail" defaultValue={user?.email || ""} readOnly className="bg-bg/50 text-text-muted" />
            </div>
            <Button>Salvar alterações</Button>
          </div>
        </section>

        {/* Preferências */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Bell size={20} className="text-accent" />
            <h3 className="text-lg font-bold text-text-primary">Preferências</h3>
          </div>
          <div className="bg-white border border-border rounded-[10px] p-8 space-y-8">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">Banca Padrão</label>
              <div className="flex bg-bg rounded-lg p-1 max-w-sm border border-border/50">
                {(['ENEM', 'SSA', 'CESAR', 'UNICAP'] as ExamType[]).map((exam) => (
                  <button
                    key={exam}
                    onClick={() => setExam(exam)}
                    className={cn(
                      'flex-1 py-2 text-xs font-bold transition-all rounded-[6px]',
                      currentEssay.exam === exam
                        ? 'bg-accent text-white shadow-sm'
                        : 'text-text-secondary hover:text-accent'
                    )}
                  >
                    {exam}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-text-muted">Esta banca será selecionada automaticamente em novas redações.</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Notificações por e-mail</p>
                <p className="text-xs text-text-muted">Receba avisos mensais sobre seu progresso.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Conta */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Shield size={20} className="text-accent" />
            <h3 className="text-lg font-bold text-text-primary">Conta</h3>
          </div>
          <div className="bg-white border border-border rounded-[10px] p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-text-primary">Sair da conta</p>
                <p className="text-xs text-text-muted leading-relaxed max-w-sm">
                  Desconectar do aplicativo neste dispositivo. Você precisará fazer login novamente para acessar suas redações.
                </p>
              </div>
              <Button variant="outline" className="w-full md:w-auto hover:bg-bg" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" />
                Sair da conta
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
