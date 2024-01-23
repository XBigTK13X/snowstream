package com.simplepathstudios.snowstream.fragment;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;

import com.simplepathstudios.snowstream.LoadingIndicator;
import com.simplepathstudios.snowstream.MainActivity;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.SnowstreamSettings;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.api.ApiClient;
import com.simplepathstudios.snowstream.viewmodel.SettingsViewModel;

public class OptionsFragment extends Fragment {
    private static final String TAG = "OptionsFragment";
    private SettingsViewModel settingsViewModel;
    private TextView versionText;
    private Button debugLogToggle;
    private TextView debugLogStatus;
    private Button updateSnowstreamButton;
    private RadioGroup serverUrlRadios;
    private RadioButton prodRadio;
    private RadioButton devRadio;
    private String lastServer;
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.options_fragment, container, false);
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        settingsViewModel = new ViewModelProvider(getActivity()).get(SettingsViewModel.class);

        updateSnowstreamButton = view.findViewById(R.id.download_update_button);
        updateSnowstreamButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(Intent.ACTION_VIEW, SnowstreamSettings.UpdateSnowstreamUrl);
                startActivity(intent);
            }
        });

        String versionInfo = String.format("Client Version: %s\nClient Built: %s",SnowstreamSettings.ClientVersion, SnowstreamSettings.BuildDate);
        versionText = view.findViewById(R.id.version_text);
        versionText.setText(versionInfo);

        debugLogStatus = view.findViewById(R.id.debug_log_status);
        debugLogStatus.setText("Debug logging is "+(SnowstreamSettings.EnableDebugLog ? "enabled" : "disabled"));

        debugLogToggle = view.findViewById(R.id.debug_log_toggle);
        debugLogToggle.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                settingsViewModel.setDebugLog(!SnowstreamSettings.EnableDebugLog);
            }
        });

        serverUrlRadios = (RadioGroup) view.findViewById(R.id.server_url_radios);
        serverUrlRadios.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener()
        {
            @Override
            public void onCheckedChanged(RadioGroup group, int checkedId) {
                if(checkedId == R.id.dev_server_radio){
                    settingsViewModel.setServerUrl(SnowstreamSettings.DevServerUrl);
                }
                if(checkedId == R.id.prod_server_radio){
                    settingsViewModel.setServerUrl(SnowstreamSettings.ProdServerUrl);
                }
            }
        });

        prodRadio = view.findViewById(R.id.prod_server_radio);
        devRadio = view.findViewById(R.id.dev_server_radio);

        settingsViewModel.Data.observe(getViewLifecycleOwner(), new Observer<SettingsViewModel.Settings>() {
            @Override
            public void onChanged(SettingsViewModel.Settings settings) {
                if(lastServer == null || !lastServer.equalsIgnoreCase(settings.ServerUrl)) {
                    if (settings.ServerUrl.equalsIgnoreCase(SnowstreamSettings.DevServerUrl)) {
                        prodRadio.setChecked(false);
                        devRadio.setChecked(true);
                    } else if (settings.ServerUrl != null) {
                        prodRadio.setChecked(true);
                        devRadio.setChecked(false);
                    }
                    lastServer = settings.ServerUrl;
                    ApiClient.retarget(settings.ServerUrl,settings.Username, settings.AuthToken);
                }
                SnowstreamSettings.EnableDebugLog = settings.EnableDebugLog;
                debugLogStatus.setText("Debug logging is "+(SnowstreamSettings.EnableDebugLog ? "enabled" : "disabled"));
            }
        });
    }
}
