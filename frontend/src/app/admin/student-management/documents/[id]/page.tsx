// src/app/admin/student-management/documents/[id]/page.tsx
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, FileText, Upload, Trash2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  fileUrl: string; // Placeholder for actual file URL
}

// Sample document data
const sampleDocuments: Document[] = [
  { id: 'doc_001', name: 'Atestado Médico (2025)', type: 'PDF', uploadDate: '2025-01-10', fileUrl: '#' },
  { id: 'doc_002', name: 'Termo de Responsabilidade', type: 'PDF', uploadDate: '2024-11-20', fileUrl: '#' },
  { id: 'doc_003', name: 'Ficha de Anamnese', type: 'PDF', uploadDate: '2024-11-20', fileUrl: '#' },
];

// Sample student data (same as in student-management/page.tsx, for demonstration)
const sampleStudents = [
  {
    id: '1',
    name: 'João da Silva',
    email: 'joao.silva@example.com',
    phone: '(32) 99123-4567',
    plan: 'Anual',
    planExpiration: '2025-12-31',
    status: 'active',
    lastPaymentDate: '2025-05-20',
  },
  {
    id: '2',
    name: 'Maria Souza',
    email: 'maria.souza@example.com',
    phone: '(32) 99234-5678',
    plan: 'Mensal',
    planExpiration: '2025-06-15',
    status: 'pending',
    lastPaymentDate: '2025-05-10',
  },
  {
    id: '3',
    name: 'Pedro Almeida',
    email: 'pedro.almeida@example.com',
    phone: '(32) 99345-6789',
    plan: 'Trimestral',
    planExpiration: '2025-09-30',
    status: 'active',
    lastPaymentDate: '2025-04-25',
  },
  {
    id: '4',
    name: 'Ana Carolina',
    email: 'ana.carol@example.com',
    phone: '(32) 99456-7890',
    plan: 'Mensal',
    planExpiration: '2025-05-01',
    status: 'inactive',
    lastPaymentDate: '2025-04-01',
  },
];

export default function StudentDocumentsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { toast } = useToast();
  const student = sampleStudents.find(s => s.id === id); // Find student by ID
  const [documents, setDocuments] = useState<Document[]>(sampleDocuments); // State to manage documents

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log('Uploading file:', file.name);
      // Simulate file upload (e.g., to Firebase Storage)
      const newDoc: Document = {
        id: `doc_${Date.now()}`, // Unique ID
        name: file.name,
        type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
        uploadDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        fileUrl: '#', // In a real app, this would be the actual download URL
      };
      setDocuments((prev) => [...prev, newDoc]);
      toast({
        title: "Documento Enviado!",
        description: `O arquivo "${file.name}" foi enviado com sucesso.`,
      });
      // Clear the input after upload
      event.target.value = '';
    }
  };

  const handleDeleteDocument = (docId: string, docName: string) => {
    if (confirm(`Tem certeza que deseja remover o documento "${docName}"?`)) {
      setDocuments((prev) => prev.filter(doc => doc.id !== docId));
      toast({
        title: "Documento Removido!",
        description: `O documento "${docName}" foi removido.`,
        variant: "destructive",
      });
    }
  };

  if (!student) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h1 className="font-headline text-3xl font-bold">Aluno não encontrado</h1>
          <p className="mt-4 text-lg text-foreground/70">O aluno com o ID {id} não foi encontrado.</p>
          <Button asChild className="mt-8">
            <Link href="/admin/student-management">Voltar à Gestão de Alunos</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="py-12 md:py-16">
        <div className="flex items-center mb-10">
          <Button variant="outline" size="icon" className="mr-4" asChild>
            <Link href="/admin/student-management"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex items-center">
            <FileText className="h-8 w-8 mr-3 text-primary shrink-0" />
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
              Documentos de {student.name}
            </h1>
          </div>
        </div>
        <p className="text-lg text-foreground/80 mb-10 max-w-3xl">
          Gerencie os documentos do aluno {student.name}, como atestados médicos e termos.
        </p>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Lista de Documentos</CardTitle>
            <CardDescription>Envie novos documentos ou gerencie os existentes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex items-center space-x-4">
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" /> Fazer Upload de Documento
                </label>
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Documento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data de Upload</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-foreground/70">
                      Nenhum documento cadastrado para este aluno.
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell>{doc.uploadDate}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" asChild>
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" title="Baixar Documento">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteDocument(doc.id, doc.name)} title="Remover Documento">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="mt-10 text-center">
          <Button asChild>
            <Link href="/admin/student-management">Voltar à Gestão de Alunos</Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
}