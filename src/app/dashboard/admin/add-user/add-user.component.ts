import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent implements OnInit {

  users:any[]=[];
  roles:any[]=[];

  showModal=false;
  editing:any=null;

  showPassword=false;

  form:any={
    name:'',
    email:'',
    mobile:'',
    password:'',
    role_id:'',
    is_active:true
  };

  constructor(private api:ApiService, private toast:ToastService){}

  ngOnInit(){
    this.load();
    this.loadRoles();
  }

  load(){
    this.api.getUsers().subscribe(res=>this.users=res);
  }

  loadRoles(){
    this.api.getRoleDropdown().subscribe(res=>this.roles=res);
  }

  openModal(user?:any){
    this.showModal=true;
    this.editing=user||null;

    this.form=user?{...user}:{name:'',email:'',mobile:'',password:'',role_id:'',is_active:true};
  }

  save(){

    if(!this.form.name || !this.form.email || !this.form.mobile || !this.form.role_id){
      this.toast.show('Fill all fields','error');
      return;
    }

    if(this.editing){
      this.api.updateUser(this.editing.id,this.form).subscribe(()=>{
        this.toast.show('Updated','success');
        this.close();
      });
    }else{
      this.api.addUser(this.form).subscribe(()=>{
        this.toast.show('Added','success');
        this.close();
      });
    }
  }

  close(){
    this.showModal=false;
    this.load();
  }
}
