import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-certificate-signature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificate-signature.component.html',
  styleUrl: './certificate-signature.component.css'
})
export class CertificateSignatureComponent implements OnInit {

  list: any[] = [];
  showModal = false;
  editing: any = null;

  form: any = {
    name: '',
    designation: '',
    signature: null,
    lab: '',
    is_active: true
  };

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getSignatures().subscribe(res => this.list = res);
  }

  openModal(item?: any) {
    this.showModal = true;
    this.editing = item || null;

    if (item) this.form = { ...item };
    else this.form = { name: '', designation: '', signature: null, is_active: true };
  }

  fileChange(event: any) {
    const file = event.target.files[0];

    if (file.type !== 'image/png') {
      this.toast.show('Only PNG allowed', 'error');
      return;
    }

    this.form.signature = file;
  }

save() {
  const fd = new FormData();

  fd.append('name', this.form.name);
  fd.append('designation', this.form.designation);
  fd.append('lab', this.form.lab);
  fd.append('is_active', this.form.is_active ? '1' : '0'); 


  if (this.form.signature instanceof File) {
    fd.append('signature', this.form.signature, this.form.signature.name);
  } else if (this.form.signature) {

    fd.append('existing_signature', this.form.signature);
  }

  const apiCall = this.editing
    ? this.api.updateSignature(this.editing.id, fd)
    : this.api.addSignature(fd);

  apiCall.subscribe({
    next: () => {
      this.toast.show(this.editing ? 'Updated' : 'Added', 'success');
      this.showModal = false;
      this.form = { name: '', designation: '', lab: '', signature: null, is_active: true };
      this.load();
    },
    error: (err) => {
      console.error('Signature save failed:', err);
      this.toast.show('Failed to save signature', 'error');
    }
  });
}

}