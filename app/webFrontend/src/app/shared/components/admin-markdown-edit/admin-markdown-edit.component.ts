import {Component, Input, OnInit} from '@angular/core';
import {IConfig} from '../../../../../../../shared/models/IConfig';
import {ConfigService} from '../../services/data.service';
import {MarkdownService} from '../../services/markdown.service';
import {errorCodes} from '../../../../../../../api/src/config/errorCodes';
import {MatSnackBar} from '@angular/material';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-admin-markdown-edit',
  templateUrl: './admin-markdown-edit.component.html',
  styleUrls: ['./admin-markdown-edit.component.scss']
})
export class AdminMarkdownEditComponent implements OnInit {

  config: IConfig;
  text: string;
  @Input() type: string;
  @Input() headingType: string;

  constructor(private service: ConfigService,
              private mdService: MarkdownService,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.headingType = params['header'];
      this.type = params['type'];
      void this.loadConfig();
    });
  }

  async loadConfig() {
    try {
      this.config = <IConfig><any> await this.service.readSingleItem(this.type);
      this.text = this.config.value;
    } catch (error) {
      this.text = '';
    }
  }
  onSave(markdown: string ) {
    try {
      void this.service.updateItem({_id: this.type, data: markdown});
      this.snackBar.open( this.headingType + ' saved', '', {duration: 3000});
    } catch (error) {
      this.snackBar.open(errorCodes.save.couldNotSaveImprint.text, '', {duration: 3000});
    }
    void this.loadConfig();
  }
  onCancel() {
    void this.loadConfig();
  }

}
