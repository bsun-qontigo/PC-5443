import { Vue, Component, Prop, WrappedComponent, compile, ChildHandler } from '@axioma/vue';
import VueTemplate from './template.vue';
import en from '../assets/en';
import { plugins } from '@axioma/common';
import { IWealthDriversBody, WealthDriversBody } from '../components/body';
import { WealthDriversPanelExpectations } from '..';

plugins.lang.mergeLocaleMessage('en', en);

@Component({
    name: 'wealth-drivers',
    components: {
        WealthDriversBody,
    }
})
export class WealthDrivers extends Vue.extend(VueTemplate) {

    @Prop()
    protected handler!: ChildHandler<WealthDriversPanelExpectations>;

    public $refs!: { 'body': HTMLDivElement };
    protected loading = false;
    protected driversBody!: WrappedComponent<IWealthDriversBody>;

    protected mounted(): void {
        this.driversBody = compile<IWealthDriversBody>({
            parent: this,
            component: WealthDriversBody,
            propsData: {
                handler: this.handler
            }
        });
        this.driversBody.$mount();
        this.$refs.body.appendChild(this.driversBody.$el);
    }
}